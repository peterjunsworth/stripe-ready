import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ProductPage from '@/app/components/products/product-page'
import type { PriceParams } from '@/types/interfaces'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn()
  }))
}))

const mockProduct = {
  name: 'Test Product',
  images: ['image1.jpg', 'image2.jpg'],
  description: 'Test description',
  marketing_features: ['Feature 1', 'Feature 2'],
  metadata: {
    variant_features: JSON.stringify([
      { name: 'Size' },
      { name: 'Color' }
    ])
  },
  shippable: true,
  default_price: {
    id: 'price_123',
    unit_amount: 2000,
    type: 'one_time'
  },
  active: true,
  package_dimensions: {
    height: 0,
    length: 0,
    weight: 0,
    width: 0
  },
  statement_descriptor: 'TEST PRODUCT'
}

const mockProductVariants = [
  {
    ...mockProduct,
    metadata: {
      variant_options: JSON.stringify({
        Size: 'Small',
        Color: 'Red'
      })
    }
  },
  {
    ...mockProduct,
    metadata: {
      variant_options: JSON.stringify({
        Size: 'Medium',
        Color: 'Blue'
      })
    }
  }
]

const mockCheapestNonRecurring: PriceParams = {
  id: 'price_456',
  unit_amount: 1500,
  type: 'one_time' as const,
  currency: 'usd',
  product: 'prod_123'
}

describe('ProductPage', () => {
  beforeEach(() => {
    // Mock localStorage with empty initial state
    const mockLocalStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    
    vi.clearAllMocks()
  })

  it('renders basic product information', () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={[]}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )
    expect(screen.getAllByText('Test Product')[0]).toBeInTheDocument()
    expect(screen.getByText('$20.00')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('displays product images and allows image selection', () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={[]}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    const thumbnails = screen.getAllByRole('img')
    expect(thumbnails).toHaveLength(3) // 2 thumbnails + 1 main image
    
    fireEvent.click(thumbnails[1])
    const mainImage = screen.getByAltText('Product Image')
    expect(mainImage).toHaveAttribute('src', 'image2.jpg')
  })

  it('handles variant selection correctly', async () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={mockProductVariants}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    const sizeSelect = screen.getByRole('button', { name: /select size/i })
    const colorSelect = screen.getByRole('button', { name: /select color/i })
    
    // Add await to ensure state updates complete
    await userEvent.click(sizeSelect)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Small' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: 'Small' }))
    
    await userEvent.click(colorSelect)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Red' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: 'Red' }))

    // Wait for button to become enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled()
    })
  })

  it('adds product to cart correctly', async () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={[]}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addToCartButton)

    // Update localStorage check to use mock
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'stripe-ready-cart',
      expect.any(String)
    )

    // Check the data passed to localStorage.setItem
    const setItemCalls = vi.mocked(window.localStorage.setItem).mock.calls
    const lastCall = setItemCalls[setItemCalls.length - 1]
    const cartData = JSON.parse(lastCall[1])
    
    expect(cartData).toHaveLength(1)
    expect(cartData[0].id).toBe('price_123')
  })

  it('adds variant to cart correctly', async () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={mockProductVariants}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    const sizeSelect = screen.getByRole('button', { name: /select size/i })
    const colorSelect = screen.getByRole('button', { name: /select color/i })

    await userEvent.click(sizeSelect)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Small' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: 'Small' }))
    
    await userEvent.click(colorSelect)
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Red' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('option', { name: 'Red' }))

    // Wait for button to become enabled before clicking
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled()
    })
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addToCartButton)

    // Check localStorage was called with correct data
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'stripe-ready-cart',
      expect.any(String)
    )
  })

  it('prevents duplicate items in cart', async () => {
    // Setup initial cart state
    const mockCartData = JSON.stringify([{
      id: mockProduct.default_price.id,
      quantity: 1
    }])
    
    // Mock localStorage with initial state
    const mockLocalStorage = {
      getItem: vi.fn(() => mockCartData),
      setItem: vi.fn(),
      clear: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    }
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    render(
      <ProductPage 
        product={mockProduct}
        productVariants={[]}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    // Add item to cart
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    await userEvent.click(addToCartButton)

    // Verify localStorage was called correctly
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'stripe-ready-cart',
      expect.any(String)
    )

    // Parse the last call's data to verify cart contents
    const setItemCalls = mockLocalStorage.setItem.mock.calls
    const lastCall = setItemCalls[setItemCalls.length - 1]
    const cartData = JSON.parse(lastCall[1])
    
    // Should still only have one item
    expect(cartData).toHaveLength(1)
    expect(cartData[0].id).toBe(mockProduct.default_price.id)
    expect(cartData[0].quantity).toBe(1) // Quantity should not increase
  })

  it('displays marketing features correctly', () => {
    render(
      <ProductPage 
        product={mockProduct}
        productVariants={[]}
        cheapestNonRecurring={mockCheapestNonRecurring}
      />
    )

    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
  })
}) 
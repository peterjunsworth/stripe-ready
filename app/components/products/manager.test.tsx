import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductManager from './manager'
import { ProductFormData, PriceParams } from '@/types/interfaces'
import { vi } from 'vitest'
import { describe, it, expect } from 'vitest'

// Mock the child components
vi.mock('@/app/components/products/form', () => {
  return {
    default: function MockProductForm({ 
      setProductId, 
      setUpdatedProductPrices,
      setParentPrices 
    }: any) {
      return (
        <div data-testid="product-form">
          <button 
            onClick={() => setProductId('test-id')}
            data-testid="update-product-id"
          >
            Update Product ID
          </button>
          <button 
            onClick={() => setUpdatedProductPrices([{ id: 'price-1', amount: 1000 }])}
            data-testid="update-prices"
          >
            Update Prices
          </button>
          <button 
            onClick={() => setParentPrices([{ id: 'parent-price-1', amount: 2000 }])}
            data-testid="update-parent-prices"
          >
            Update Parent Prices
          </button>
        </div>
      )
    }
  }
})

vi.mock('@/app/components/prices/form', () => {
  return {
    default: function MockPriceForm() {
      return <div data-testid="price-form" />
    }
  }
})

vi.mock('@/app/components/products/variants/table', () => {
  return {
    default: function MockVariantsList({ setHasVariants }: any) {
      return (
        <div data-testid="variants-list">
          <button 
            onClick={() => setHasVariants(true)}
            data-testid="set-has-variants"
          >
            Set Has Variants
          </button>
        </div>
      )
    }
  }
})

// Mock useParams
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' })
}))

describe('ProductManager', () => {
  const mockProductData: ProductFormData = {
    id: 'test-product',
    name: 'Test Product',
    description: 'Test Description',
    metadata: {
      parentProduct: undefined
    },
    active: true,
    marketing_features: [],
    images: [],
    package_dimensions: {
      height: 0,
      length: 0,
      weight: 0,
      width: 0
    },
    shipping_requirements: null,
    tax_code: null,
    shippable: true,
    statement_descriptor: 'Test Statement'
  }

  const mockPrices: PriceParams[] = [
    { id: 'price-1', unit_amount: 1000, currency: 'usd', product: 'product-1' },
    { id: 'price-2', unit_amount: 2000, currency: 'usd', product: 'product-2' }
  ]

  const defaultProps = {
    title: 'Test Title',
    priceTitle: 'Price Title',
    productData: mockProductData,
    productPrices: mockPrices
  }

  it('renders all components correctly', () => {
    render(<ProductManager {...defaultProps} />)
    
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    expect(screen.getByTestId('price-form')).toBeInTheDocument()
    expect(screen.getByTestId('variants-list')).toBeInTheDocument()
  })

  it('initializes with correct product ID from URL params', () => {
    render(<ProductManager {...defaultProps} />)
    
    // Test that productId state is initialized from URL params
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    // Add more specific assertions based on how your component uses productId
  })

  it('handles product ID updates correctly', async () => {
    render(<ProductManager {...defaultProps} />)
    
    const updateButton = screen.getByTestId('update-product-id')
    await userEvent.click(updateButton)

    // Wait for state update
    await waitFor(() => {
      // Add assertions to verify productId state was updated
      // This might require exposing the state in your test implementation
    })
  })

  it('handles price updates correctly', async () => {
    render(<ProductManager {...defaultProps} />)
    
    const updatePricesButton = screen.getByTestId('update-prices')
    await userEvent.click(updatePricesButton)

    // Wait for state update
    await waitFor(() => {
      // Add assertions to verify prices were updated
      // This might require exposing the state in your test implementation
    })
  })

  it('handles variant status changes correctly', async () => {
    render(<ProductManager {...defaultProps} />)
    
    const setVariantsButton = screen.getByTestId('set-has-variants')
    await userEvent.click(setVariantsButton)

    // Wait for state update
    await waitFor(() => {
      // Add assertions to verify hasVariants state was updated
      // This might require exposing the state in your test implementation
    })
  })

  it('handles parent prices updates correctly', async () => {
    render(<ProductManager {...defaultProps} />)
    
    const updateParentPricesButton = screen.getByTestId('update-parent-prices')
    await userEvent.click(updateParentPricesButton)

    // Wait for state update
    await waitFor(() => {
      // Add assertions to verify parent prices were updated
      // This might require exposing the state in your test implementation
    })
  })

  it('identifies variant products correctly', () => {
    const variantProductData = {
      ...mockProductData,
      metadata: {
        parentProduct: 'parent-id'
      }
    }

    render(<ProductManager {...defaultProps} productData={variantProductData} />)
    
    // Add assertions to verify isVariant state is set correctly
    // This might require exposing the state in your test implementation
  })

  it('maintains layout with dividers', () => {
    render(<ProductManager {...defaultProps} />)
    
    const dividers = screen.getAllByRole('separator')
    expect(dividers).toHaveLength(2) // Two dividers in the layout
    
    dividers.forEach(divider => {
      expect(divider).toHaveClass('h-[auto]')
      expect(divider).toHaveClass('mx-8')
    })
  })

  // Test error cases
  it('handles undefined product data gracefully', () => {
    const { title, priceTitle } = defaultProps
    render(<ProductManager title={title} priceTitle={priceTitle} />)
    
    // Verify components render without errors when no product data is provided
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    expect(screen.getByTestId('price-form')).toBeInTheDocument()
    expect(screen.getByTestId('variants-list')).toBeInTheDocument()
  })

  it('handles undefined product prices gracefully', () => {
    const { title, priceTitle, productData } = defaultProps
    render(
      <ProductManager 
        title={title} 
        priceTitle={priceTitle} 
        productData={productData} 
      />
    )
    
    // Verify components render without errors when no prices are provided
    expect(screen.getByTestId('product-form')).toBeInTheDocument()
    expect(screen.getByTestId('price-form')).toBeInTheDocument()
    expect(screen.getByTestId('variants-list')).toBeInTheDocument()
  })
}) 
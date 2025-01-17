type Params = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Params) {
  return { title: `Stripe Product: ${params.id}` };
}

export default function Page({ params }: Params) {
  return <h1>ID: {params.id}</h1>;
}

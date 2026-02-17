
interface Props {
    title: string;
    subTitle?: string;
}

export const CustomJumbotron = ({ title, subTitle }: Props) => {

  const defaultSubtitle = 'Descubre nuestras ofertas.';
  
  return (
    <>
          {/* Hero Section */}
      <section className="pt-8 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto text-center">
          <h1 className=" font-montserrat text-2xl lg:text-5xl tracking-tight mb-6">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {subTitle || defaultSubtitle}
          </p>
        </div>
      </section>
    </>
  )
}



export const CustomFooter = () => {
  return (
    <>
        {/* Footer */}
        <footer className="border-t py-12 px-4 lg:px-8 mt-16">
            <div className="container mx-auto">
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} <span className="font-bold">CARNICERIA FMP</span>. Todos los derechos reservados.</p>
            </div>
            </div>
        </footer>
    </>
  )
}

// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">ERP Agência de Marketing</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema completo para gestão da sua agência
        </p>
        <a 
          href="/auth" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Acessar Sistema
        </a>
      </div>
    </div>
  );
};

export default Index;

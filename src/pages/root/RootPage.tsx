// src/pages/RootPage.tsx

const RootPage = () => {
  const buttonClick = () => {
    console.log('Action');
  };

  return (
    <section>
      <h1>React SSR</h1>
      <button onClick={buttonClick}>Action Button</button>
    </section>
  );
};

export default RootPage;

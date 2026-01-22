import Hero from "./Hero.jsx";
import Categories from "./Categories.jsx";
import Tagline from "./Tagline.jsx";

const Home = ({ navigate }) => {
  return (
    <>
      <Hero />
      <Categories navigate={navigate} />
      <Tagline />
    </>
  );
};

export default Home;

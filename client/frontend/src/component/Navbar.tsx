import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import navImg from "../assets/home/nav.webp";
import navHomeImg from "../assets/home/nav1.webp";
import navSushiImg from "../assets/home/nav2.webp";
import navAnswerImg from "../assets/home/nav3.webp";
import "../styles/Navbar.css";
import UserMenuModal from "./modal/UserMenuModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bgImage, setBgImage] = useState(navImg);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const preloadImages = [navHomeImg, navSushiImg, navAnswerImg];
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const getBgImage = () => {
      switch (location.pathname.toLowerCase()) {
        case "/home":
          return navHomeImg;
        case "/mysushilist":
          return navSushiImg;
        case "/myanswerlist":
          return navAnswerImg;
        default:
          return navImg;
      }
    };

    const newBgImage = getBgImage();
    if (bgImage !== newBgImage) {
      setBgImage(newBgImage);
    }
  }, [location.pathname, bgImage]);

  return (
    <>
      <nav className="navbar" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="navbar__content">
          <div className="navbar__item" onClick={() => navigate("/home")} />
          <div
            className="navbar__item"
            onClick={() => navigate("/mysushilist")}
          />
          <div
            className="navbar__item"
            onClick={() => navigate("/myanswerlist")}
          />
          <div className="navbar__item" onClick={() => setIsModalOpen(true)} />
        </div>
      </nav>
      <UserMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;

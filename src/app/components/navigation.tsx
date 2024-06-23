"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FunctionComponent } from "react";
import styled from "styled-components";
import { useState } from "react";
import { FaBars, FaLinkedin, FaGithub } from "react-icons/fa";

const HEIGHT = "3rem";
const SMALL_SCREEN_SIZE_PX = 768;
const MENU_LINK_HEIGHT_REM = 2;

const MobileOnly = styled.span`
  display: none;
  margin-left: 5px;

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    display: inline;
  }
`;

const PATHS: Array<{
  href: string;
  contents: string | JSX.Element;
  type: 'internal' | 'external';
}> = [
  {
    href: "/",
    contents: "Me",
    type: 'internal',
  },
  {
    href: "/content",
    contents: "Educational Content",
    type: 'internal',
  },
  {
    href: 'https://www.linkedin.com/in/smlanning/',
    contents: <>
      <FaLinkedin style={{fontSize: "1.5rem"}} />
      <MobileOnly>LinkedIn</MobileOnly>
    </>,
    type: 'external',
  },
  {
    href: 'https://github.com/s0',
    contents: <>
      <FaGithub style={{fontSize: "1.5rem"}} />
      <MobileOnly>GitHub</MobileOnly>
    </>,
    type: 'external',
  },
];

const NavWrapper = styled.div`
  height: ${HEIGHT};
  width: 100%;

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    height: auto;
  }
`;

const NavRoot = styled.nav`
  position: fixed;
  z-index: 1000;
  width: 100%;

  background: #340152e0;
  // background: linear-gradient(#460152, #240152);
  border-bottom: 2px solid rgba(187, 80, 185, 1);
  box-shadow: 0 2px 10px #240152;
  color: #ffffffe0;
  padding: 0 20px;

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    padding: 10px 20px;
    position: relative;
  }
`;

const NavItems = styled.div`
  height: ${HEIGHT};
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    height: auto;
  }
`;

const NavTitle = styled.h2`

`;

const MenuIcon = styled.a`
display: none;
cursor: pointer;

@media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 1.5rem;
  flex-grow: 1;
}
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
  font-size: 1rem;
  margin: 0 -15px;

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;

    &.open {
      max-height: ${MENU_LINK_HEIGHT_REM * PATHS.length}rem;
    }
  }
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  margin: 0 15px;
  display: inline-flex;
  align-items: center;

  &:hover, &.active {
    text-decoration: underline;
    opacity: 1;
  }

  span {
    margin-right: 5px;
  }

  @media (max-width: ${SMALL_SCREEN_SIZE_PX}px) {
    height: ${MENU_LINK_HEIGHT_REM}rem;
  }
`;


export const Navigation: FunctionComponent = () => {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(value => !value);
  };
  return (
    <NavWrapper>
      <NavRoot>
        <NavItems>
          <NavTitle>Sam Lanning</NavTitle>
          <MenuIcon onClick={handleMenuToggle}>
            <FaBars/>
          </MenuIcon>
          <Menu className={isMenuOpen ? 'open' : ''}>
            {
              PATHS.map(({ href, contents, type }) => (
                <MenuLink
                  key={href}
                  href={href}
                  className={pathname === href ? "active" : ""}
                  target={ type === 'external' ? "_blank" : undefined}
                  rel={ type === 'external' ? "noopener noreferrer" : undefined}
                >
                  {contents}
                </MenuLink>
              ))
            }
          </Menu>
        </NavItems>
      </NavRoot>
    </NavWrapper>
  );
};

export default Navigation;

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FunctionComponent } from "react";
import styled from "styled-components";

const HEIGHT = "3rem";

const NavWrapper = styled.div`
  height: ${HEIGHT};
  width: 100%;
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
`;

const NavItems = styled.div`
  height: ${HEIGHT};
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
`;

const NavTitle = styled.h2`

`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-grow: 1;
  font-size: 1rem;
  margin: 0 -15px;
`;

const StyledLink = styled(Link)`
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
`;

const OctocatSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 16 16"
    fill="currentColor"
    stroke="none"
  >
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
  </svg>
);

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
    href: "https://s0.github.io/teaching-resources/",
    contents: "Learning Resources",
    type: 'internal',
  },
  {
    href: 'https://www.linkedin.com/in/smlanning/',
    contents: "LinkedIn",
    type: 'external',
  },
  {
    href: 'https://github.com/s0',
    contents: <>
      <span>@s0</span>
      <OctocatSvg/>
    </>,
    type: 'external',
  },
];

export const Navigation: FunctionComponent = () => {
  const pathname = usePathname();

  return (
    <NavWrapper>
      <NavRoot>
        <NavItems>
          <NavTitle>Sam Lanning</NavTitle>
          <Menu>
            {
              PATHS.map(({ href, contents, type }) => (
                <StyledLink
                  key={href}
                  href={href}
                  className={pathname === href ? "active" : ""}
                  target={ type === 'external' ? "_blank" : undefined}
                  rel={ type === 'external' ? "noopener noreferrer" : undefined}
                >
                  {contents}
                </StyledLink>
              ))
            }
          </Menu>
        </NavItems>
      </NavRoot>
    </NavWrapper>
  );
};

export default Navigation;

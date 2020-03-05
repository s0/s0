import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import Background from '../background';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
    font-size: 23px;
    font-weight: 500;
  }

  * {
    box-sizing: border-box;
  }

  h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
    font-weight: 500;
  }

  h1 {
    font-size: 30px;
  }

  h2 {
    font-size: 20px;
  }

  p, ul {
    font-size: 17px;
  }

  a {
    color: inherit;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
`

interface Props {
  className?: string;
}

class Home extends React.Component<Props, {}> {
  public render() {
    return (
      <div className={this.props.className}>
        <GlobalStyle/>
        <Background className="background" />
        <div className="content">
          <div className="inner">
            <div className="container">
              <div className="top">
                <img src="images/sam_250x2.png" height="250" />
                <div>
                  <h1>Sam Lanning</h1>
                  <h2>Software Engineer - Developer Advocate - Speaker - Lighting Designer</h2>
                  <p>Core Interests: Open Source Software, Security &amp; Privacy, Code Quality, Variant Analysis, Lighting &amp; TypeScript</p>
                  <p>Developer Advocate for <a href="https://semmle.com" target="_blank">Semmle</a></p>
                  <p>
                    <a href="https://github.com/s0" target="_blank">GitHub</a> - <a href="https://www.npmjs.com/~s0" target="_blank">NPM</a> - <a href="https://twitter.com/samlanning" target="_blank">Twitter</a> - <a href="https://www.linkedin.com/in/smlanning/" target="_blank">LinkedIn</a>
                  </p>
                  <p>
                    Email: <a href="mailto:sam@samlanning.com">sam@samlanning.com</a>
                  </p>
                </div>
              </div>
              <div className="section">
                <h2>Current Endeavours</h2>
                <ul>
                  <li>
                    <a href="https://synesthesia-project.org/" target="_blank">Synesthesia Project</a> - An open source lighting &amp; sound project
                  </li>
                  <li>
                    <a href="https://queeriouslabs.com/" target="_blank">Queerious Labs</a> - A queer, anarchafeminist art+tech community workshop.
                  </li>
                  <li>
                    Numerous <a href="https://github.com/s0" target="_blank">GitHub Repositories and Open Source Contributions</a>.
                  </li>
                </ul>
              </div>
              <div className="section">
                <h2>Public Speaking</h2>
                <ul>
                  <li>
                    No More Whack-a-Mole: How to Find and Prevent Entire Classes of Security Vulnerabilities:
                    <ul>
                      <li><a href="https://www.youtube.com/watch?v=7pXvZsMRVig" target="_blank">Nov 2019 - BLACK ALPS (Video)</a></li>
                      <li><a href="https://www.youtube.com/watch?v=1wbt1xM9jUc" target="_blank">Sep 2019 - OWASP Global AppSec Amsterdam (Video)</a></li>
                      <li><a href="https://www.youtube.com/watch?v=HMXa26xJE9Q" target="_blank">Sep 2019 - BalCCon2k19 (Video)</a></li>
                      <li><a href="https://www.youtube.com/watch?v=IY7fL7Tkxxc" target="_blank">May 2019 - RVAsec (Video)</a></li>
                    </ul>
                  </li>
                  <li>
                    Jul 2019 - OSCON - <a href="https://www.youtube.com/watch?v=m6Jr6w0W1xw" target="_blank">Writing npm (JavaScript) libraries using TypeScript (Video)</a>
                  </li>
                  <li>
                    Jul 2019 - OSCON - <a href="https://www.youtube.com/watch?v=b8AHUXxGas8" target="_blank">How TypeScript is transforming the JavaScript ecosystem (Video)</a>
                  </li>
                  <li>
                    Oct 2018 - Oracle Code One - <a href="https://oracle.rainfocus.com/widget/oracle/oow18/catalogcodeone18?search=DEV5219" target="_blank">How to Avoid 0-Days Due to Unsafe Deserialization [DEV5219] (Joint talk with Oege de Moor &amp; Bas van Schaik)</a>
                  </li>
                  <li>
                    Oct 2018 - GitHub Universe Demo Desk - <a href="https://www.youtube.com/watch?v=aXqUWZYlFzs" target="_blank">Finding and preventing bugs with LGTM (Video)</a>
                  </li>
                  <li>
                    Jan 2017 - Noisebridge 5MOF - <a href="https://www.youtube.com/watch?v=egsswPi8yio" target="_blank">Lights &amp; Music (Video)</a>
                  </li>
                </ul>
              </div>
              <div className="section">
                <h2>Career</h2>
                <ul className="bolded">
                  <li>
                    <strong>Nov 2019 - Present</strong> - Senior Developer Advocate @ <a href="https://github.com" target="_blank">GitHub</a>
                  </li>
                  <li>
                    <strong>Mar 2018 - Nov 2019</strong> - Developer Advocate @ <a href="https://semmle.com" target="_blank">Semmle</a>
                  </li>
                  <li>
                    <strong>Feb 2018 - Mar 2018</strong> - Senior Software Engineer @ <a href="https://semmle.com" target="_blank">Semmle</a>
                  </li>
                  <li>
                    <strong>Oct 2014 - Feb 2018</strong> - Software Engineer @ <a href="https://semmle.com" target="_blank">Semmle</a>
                  </li>
                  <li>
                    <strong>Nov 2014 - Jul 2015</strong> - Computer Science Specialist Tutor @ <a href="https://www.lvs-oxford.org.uk/" target="_blank">LVS Oxford</a> - a school for young people / children on the autistic spectrum
                  </li>
                  <li>
                    <strong>Feb 2012 - Feb 2014</strong> - Spent 1 year as Secretary, and 1 year as President of the Oxford University Computer Society
                  </li>
                  <li>
                    <strong>2011 - 2014</strong> - Computer Science Bachelor's Degree, University of Oxford.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const SPACING = 10;

export default styled(Home)`
  color: #444;

  > .background {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  > .content {
    pointer-events: none;
    min-height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > .inner {
      width: 100%;
      padding: 20px;

      > .container {
        pointer-events: all;
        display: flex;
        flex-direction: column;
        max-width: 800px;
        margin: 0 auto;
        background: rgba(187, 80, 185, 0.35);
        border: 2px solid rgba(187, 80, 185, 1);
        border-radius: 5px;
        padding: ${SPACING}px ${SPACING}px ${SPACING * 2}px;
        color: #fff;

        > .top {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          padding: ${SPACING / 2}px;

          > img {
            border-radius: 5px;
            margin: ${SPACING / 2}px;
          }

          > div {
            margin: ${SPACING / 2}px;
            flex-grow: 1;
            flex-basis: 400px;
            p {
              font-size: 16px;
              font-weight: 500;
              margin: ${SPACING}px 0 0;
            }
          }
        }

        > .section {
          h2 {
            padding: ${SPACING * 2}px ${SPACING}px ${SPACING}px;
          }

          ul {
            margin: ${SPACING}px 0 0;

            ul {
              margin-bottom: ${SPACING}px;
            }

            &.bolded {
              font-weight: 400;

              strong {
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }
`
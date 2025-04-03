import { Background } from "../components/background";
import Navigation from "../components/navigation";
import { PageContent } from "../components/pages/content-page";

export default function Homepage() {
  return (
    <>
      <Background mode="dark" />
      <Navigation />
      <PageContent>
        <h1>Educational Content</h1>
        <p>
          Here you&apos;ll find a number of resources that I&apos;ve created
          that cover technical topics.
        </p>
        <h2>
          <a href="https://s0.github.io/teaching-resources/" target="_blank">
            Teaching Resources
          </a>
        </h2>
        <p>
          During my time as a tutor at LVS Oxford, I produced a number of
          lessons and acompanying content
        </p>
        <ul>
          <li>
            <a
              href="https://s0.github.io/teaching-resources/python/space_shooter/"
              target="_blank"
            >
              Python: Space Shooter Game
            </a>{" "}
            - During the course of this lesson, students should be able to
            create a side-scroller alien shooter game, with keyboard controls.
          </li>
          <li>
            <a
              href="https://s0.github.io/teaching-resources/java/robot_project/"
              target="_blank"
            >
              Java: Robot control system
            </a>{" "}
            - To get an introduction to Java, students will be programming a
            virtual robot so that it can navigate its way around a maze and find
            the finishing (blue) tile.
          </li>
        </ul>
        <h2>Talks</h2>
        <ul>
          <li>
            Jan 2023 - Refresh -{" "}
            <a
              href="https://www.youtube.com/watch?v=pGKVVFnnaC0"
              target="_blank"
            >
              Why Use TypeScript and How to Migrate Your Large Projects (Video)
            </a>
          </li>
          <li>
            Jul 2019 - OSCON -{" "}
            <a
              href="https://www.youtube.com/watch?v=m6Jr6w0W1xw"
              target="_blank"
            >
              Writing npm (JavaScript) libraries using TypeScript (Video)
            </a>
          </li>
          <li>
            Jul 2019 - OSCON -{" "}
            <a
              href="https://www.youtube.com/watch?v=b8AHUXxGas8"
              target="_blank"
            >
              How TypeScript is transforming the JavaScript ecosystem (Video)
            </a>
          </li>
        </ul>
      </PageContent>
    </>
  );
}

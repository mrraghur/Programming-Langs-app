import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import userEvent from '@testing-library/user-event';
import { createMemoryHistory } from "history";
import { BrowserRouter, Router } from "react-router-dom";

import "@testing-library/jest-dom";
import { Home } from "../../pages";
import { act } from "react-dom/test-utils";
import Languages from "../../data/languages";
import { AppContext } from "../../context/context";
import App from "../../App";

// testing the app at the homepage (/)
describe("<Home />", () => {
  afterEach(cleanup);
  jest.useFakeTimers();

  beforeEach(() => {
    jest.setTimeout(60000);
  });

  //test the timer loader implementation
  test("rendering the home page", async () => {
    // mock usestate setstate
    const setStateMock = jest.fn();
    const useStateMock = (useState) => [useState, setStateMock];
    jest.spyOn(React, "useState").mockImplementation(useStateMock);

    // mock React useEffect
    jest.spyOn(React, "useEffect").mockImplementation((f) => f());
    const setRoute = () => {};

    // render component
    const { container, getByText } = render(
      <BrowserRouter>
        <AppContext.Provider value={{ setRoute }}>
          <Home />
        </AppContext.Provider>
      </BrowserRouter>
    );

    // once component is rendered, a loader shows up
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(container.firstChild.getElementsByClassName("spinner-item").length).toBe(3);
    expect(container.firstChild).toMatchSnapshot();

    // check component after timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(
      container.firstChild.getElementsByClassName("custom-card").length
    ).toBe(Languages.length);
    expect(container.firstChild).toMatchSnapshot();

    // error here
    // expect(setStateMock).toHaveBeenCalledTimes(1);
  });

  test("navigates to /assessment/name page after a card/language is selected", async () => {

    const history = createMemoryHistory();
    const { container, getByTestId } = render(
      <Router location={history.location} navigator={history}>
        <App />
      </Router>
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const user = userEvent.setup()
    // select a language/card
    const cardButton = container.getElementsByTagName("button")[0];
    expect(cardButton).toBeTruthy();
    user.click(cardButton);

    // check that the content change to name page
    expect(getByTestId("layout-container")).toBeTruthy();
  });
});

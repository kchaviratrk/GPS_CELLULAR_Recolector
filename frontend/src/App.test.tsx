import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import App, { DeviceContext } from "./App";

test("renders welcome message", () => {
  const mockDevices: never[] = [];
  const mockSetDevices = jest.fn();

  render(
    <I18nextProvider i18n={i18n}>
      <DeviceContext.Provider
        value={{ devices: mockDevices, setDevices: mockSetDevices }}
      >
        <App />
      </DeviceContext.Provider>
    </I18nextProvider>
  );

  const welcomeElement = screen.getByText(
    /welcome to the device monitoring dashboard/i
  );
  expect(welcomeElement).toBeInTheDocument();
});

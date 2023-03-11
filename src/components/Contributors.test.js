/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import Contributors from "./Contributors";
import React from "react";
import "@testing-library/jest-dom";
import fetch from "node-fetch";

// fake API call
const fakeAPICall = (request) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (request.method) {
        case "get":
          const data = [
            ["name1", "contribution1", "socials1", "favouriteSeaAnimal1", "hi"],
            [
              "name2",
              "contribution2",
              "socials2",
              "favouriteSeaAnimal2",
              "bye",
            ],
          ];
          resolve({ status: 200, data });
          break;
        default:
          resolve({ status: 400, message: "Bad Request" });
      }
    }, 300);
  });
};

// TODO
// 1. api endpointtest
// 2. mock fetch in front UI tests
describe.skip("Contributors", () => {
  describe("API endpoint", () => {
    test("respond with an array", async () => {
      // TODO: fetch from API point and test
      const data = await fakeAPICall({ method: "get" });
      expect(Array.isArray(data.data)).toBeTruthy();
    });
    test("should be an array of objects", async () => {
      const data = await fakeAPICall({ method: "get" });
      expect(data.data.length).toBe(2);
    });
    test("should contain the correct data", async () => {});
  });

  describe("Frontend UI", () => {
    test("should include a title named Contributors", () => {
      // TODO: to mock the API fetch

      render(<Contributors />);

      const text = screen.getByRole("heading", {
        name: /contributors/i,
      });
      expect(text).toBeInTheDocument();
    });
    test("should display a name", async () => {
      render(<Contributors />);

      const data = await fakeAPICall({ method: "get" });

      const name = screen.getByRole("heading", {
        name: new RegExp(data.data[0][0]),
      });

      expect(name).toBeInTheDocument();
      expect(name).toHaveTextContent("name1");
    });
    test("should display a contribution", async () => {
      render(<Contributors />);
      const data = await fakeAPICall({ method: "get" });
      const contribution = screen.getByTestId("contribution", {
        name: new RegExp(data.data[0][1]),
      });

      expect(contribution).toBeInTheDocument();
      expect(contribution).toHaveTextContent("contribution1");
    });

    test("should display a favourite sea animal", async () => {
      render(<Contributors />);
      const data = await fakeAPICall({ method: "get" });
      const favouriteSeaAnimal = screen.getByTestId("favouriteSeaAnimal", {
        name: new RegExp(data.data[0][2]),
      });

      expect(favouriteSeaAnimal).toBeInTheDocument();
      expect(favouriteSeaAnimal).toHaveTextContent("favouriteSeaAnimal1");
    });
    test("should display a social url", async () => {
      render(<Contributors />);
      const data = await fakeAPICall({ method: "get" });
      const social = screen.getByTestId("social", {
        name: new RegExp(data.data[0][3]),
      });

      expect(social).toBeInTheDocument();
      expect(social).toHaveTextContent("socials1");
    });
    test("should display a emoji", async () => {
      render(<Contributors />);
      const data = await fakeAPICall({ method: "get" });
      const emoji = screen.getByTestId("emoji", {
        name: new RegExp(data.data[0][4]),
      });

      expect(emoji).toBeInTheDocument();
      expect(emoji).toHaveTextContent("hi");
    });
  });
});

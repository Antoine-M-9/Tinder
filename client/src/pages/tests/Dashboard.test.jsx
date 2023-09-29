import React from "react";
import axios from "axios";
import {
  render,
  fireEvent,
  act,
  waitFor,
  renderHook,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../Dashboard";
import mockAxios from "jest-mock-axios";
import { useCookies } from "react-cookie";

afterEach(() => {
  jest.clearAllMocks();
});
// nettoyer toutes les instances et appels après chaque tests

jest.mock("axios");
jest.mock("react-cookie");

describe("Dashboard Component", () => {
  test("getUser function returns user data as expected", async () => {
    const userId = "123";

    const data = {
      user_id: userId,
      email: "user3@gmail.com",
      hashed_password:
        "$2b$10$tiEYegD8cjIOIWi7kXOdX.66FRM6PHOXf2xNCZH/2HgXKph8uwaW.",
      about: "I like potatoes",
      dob_day: "12",
      dob_month: "2",
      dob_year: "2001",
      first_name: "user3",
      gender_identity: "man",
      gender_interest: "woman",
      matches: [],
      show_gender: false,
      url: "https://images.unsplash.com/photo.png",
    };

    axios.get.mockResolvedValueOnce({data});
    useCookies.mockReturnValue([{ UserId: userId }]);

    const { findByText } = render(<Dashboard />);

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    const userNameElement = await findByText(data.first_name);
    expect(userNameElement).toBeInTheDocument();
  });
});

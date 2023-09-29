import "@testing-library/jest-dom";
import { render, fireEvent, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import AuthModal from "../AuthModal";
import React from "react";
import { CookiesProvider } from "react-cookie";

jest.mock("axios"); // permet de simuler une requête axios

describe.only("AuthModal Component", () => {
  //test('...) définit un nouveau test avec la description
  test("renders error message when passwords do not match", () => {
    const { getByPlaceholderText, getByText, getByRole } = render(
      <Router>
        <AuthModal isSignUp={true} />
      </Router>
    );

    // AuthModal est rendu à l'aide de la fonction render de testing-library. le composant est enveloppé dans un router car il peut utiliser des fonctionnalités de routage comme Link, useHistory, useNavigate

    const emailInput = getByPlaceholderText("email");
    const passwordInput = getByPlaceholderText("password");
    const confirmPasswordInput = getByPlaceholderText("confirm password");
    const submitButton = getByRole("button", { name: /submit/i });
    // permet de sélectionner les éléments

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "differentpassword" },
    });

    fireEvent.click(submitButton);
    // Permet de simuler des évènement sur les élément sélectionné précédemment
    // ex permet d'entrer un email dans l'élément email prévu à cet effet.

    const errorMessage = getByText("Passwords need to match!");
    expect(errorMessage).toBeInTheDocument();
    // le test vérifie si un message d'erreur indiquant que les mots de passe doivent correspondre est affiché à l'écran
  });

  test("submits form with correct values", async () => {
    const mockResponse = { status: 201, data: { userId: "123", token: "abc" } };
    axios.post.mockResolvedValue(mockResponse); // défini une valeur de résolution pour la requête axios

    delete window.location;
    window.location = { reload: jest.fn() }; // utilise un mock pour remplacer window.location.reload

    const { getByPlaceholderText, getByRole } = render(
      <Router>
        <AuthModal isSignUp={true} />
      </Router>
    );

    const emailInput = getByPlaceholderText("email");
    const passwordInput = getByPlaceholderText("password");
    const confirmPasswordInput = getByPlaceholderText("confirm password");
    const submitButton = getByRole("button", { name: /submit/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@gmail.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "password" } });

      fireEvent.click(submitButton);
    });

    // act est une fonction founie par test-react et permet d'encapsuler les mise à jour d'état react dans les tests.
    // Lorsque que l'on effectue des tests qui entraînent des mises à jours de l'état React, il faut s'assurer que ces mise à jours sont enveloppées dans act(...). Cela garentit que toutes les mises à jours de l'état sont terminées avant que le test ne continue

    expect(axios.post).toHaveBeenCalledWith("http://localhost:8000/signup", {
      email: "test@gmail.com",
      password: "password",
    });
  });

  test("vérifie que le message d'erreur s'affiche et que l'utilisateur est redirigé si les cookies ne sont pas définis", async () => {
    const mockResponse = { status: 201, data: { userId: null, token: null } };
    axios.post.mockResolvedValue(mockResponse); // défini une valeur de résolution pour la requête axios

    const { getByPlaceholderText, getByRole, findByText } = render(
      <Router>
        <CookiesProvider>
          <AuthModal isSignUp={true} />
        </CookiesProvider>
      </Router>
    );

    const emailInput = getByPlaceholderText("email");
    const passwordInput = getByPlaceholderText("password");
    const confirmPasswordInput = getByPlaceholderText("confirm password");
    const submitButton = getByRole("button", { name: /submit/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);
    });

    // Vérifiez que le message d'erreur s'affiche
    const errorMessage = await findByText(
      "There was a problem setting the cookies"
    );
    expect(errorMessage).toBeInTheDocument();

    // Vérifiez que l'utilisateur est redirigé vers la page d'accueil
    // Vous devrez peut-être utiliser une bibliothèque de mock de navigation ou un outil similaire pour tester cela
  });
});

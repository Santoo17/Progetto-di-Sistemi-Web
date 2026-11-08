require "swagger_helper"

RSpec.describe "auth", type: :request do
  let(:user) { User.create!(name: "Test", email: "test@example.com", password: "password123") }
  let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: user.id)}" }

  path "/auth/login" do
    post("login") do
      tags "Auth"
      consumes "application/json"
      produces "application/json"
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: { email: { type: :string }, password: { type: :string } },
        required: %w[email password]
      }

      response(200, "login riuscito, restituisce token e utente") do
        let(:body) { { email: user.email, password: "password123" } }
        run_test!
      end

      response(401, "credenziali non valide") do
        let(:body) { { email: user.email, password: "sbagliata" } }
        run_test!
      end
    end
  end

  path "/auth/logout" do
    post("logout") do
      tags "Auth"
      security [{ bearerAuth: [] }]
      parameter name: :Authorization, in: :header, type: :string

      response(204, "logout eseguito") { run_test! }
    end
  end

  path "/auth/me" do
    get("utente corrente") do
      tags "Auth"
      security [{ bearerAuth: [] }]
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string

      response(200, "dati utente") { run_test! }

      response(401, "non autenticato") do
        let(:Authorization) { "Bearer non-valido" }
        run_test!
      end
    end
  end
end
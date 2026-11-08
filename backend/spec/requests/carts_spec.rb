require "swagger_helper"

RSpec.describe "carts", type: :request do
  let(:user) { User.create!(name: "Test", email: "test@example.com", password: "password123") }
  let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: user.id)}" }

  path "/cart" do
    get("mostra il carrello") do
      tags "Cart"
      security [{ bearerAuth: [] }]
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string

      response(200, "successful") { run_test! }

      response(401, "non autenticato") do
        let(:Authorization) { "Bearer non-valido" }
        run_test!
      end
    end
  end
end
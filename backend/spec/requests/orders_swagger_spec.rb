require "swagger_helper"

RSpec.describe "orders (OpenAPI)", type: :request do
  let(:user)    { User.create!(name: "Test", email: "test@example.com", password: "password123") }
  let(:product) { Product.create!(title: "Cuffie", price: 49.90) }
  let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: user.id)}" }

  path "/orders" do
    get("elenco ordini dell'utente") do
      tags "Orders"
      security [{ bearerAuth: [] }]
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string

      response(200, "successful") { run_test! }
    end

    post("crea un ordine dal carrello") do
      tags "Orders"
      security [{ bearerAuth: [] }]
      consumes "application/json"
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          shipping_address: { type: :string },
          city: { type: :string },
          postal_code: { type: :string }
        },
        required: %w[shipping_address city postal_code]
      }

      response(201, "ordine creato") do
        before do
          user.create_cart!.cart_items.create!(product: product, quantity: 1, unit_price: product.price)
        end
        let(:body) { { shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121" } }
        run_test!
      end

      response(422, "carrello vuoto o dati non validi") do
        let(:body) { { shipping_address: "Via Roma 1", city: "Ferrara", postal_code: "44121" } }
        run_test!
      end
    end
  end
end
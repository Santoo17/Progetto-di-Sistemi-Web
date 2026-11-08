require "swagger_helper"

RSpec.describe "cart items", type: :request do
  let(:user)    { User.create!(name: "Test", email: "test@example.com", password: "password123") }
  let(:product) { Product.create!(title: "Cuffie", price: 49.90) }
  let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: user.id)}" }

  path "/cart/items" do
    post("aggiunge un prodotto al carrello") do
      tags "Cart"
      security [{ bearerAuth: [] }]
      consumes "application/json"
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: { product_id: { type: :integer }, quantity: { type: :integer } },
        required: %w[product_id quantity]
      }

      response(201, "prodotto aggiunto") do
        let(:body) { { product_id: product.id, quantity: 1 } }
        run_test!
      end

      response(422, "quantità non valida") do
        let(:body) { { product_id: product.id, quantity: -1 } }
        run_test!
      end

      response(401, "non autenticato") do
        let(:Authorization) { "Bearer non-valido" }
        let(:body) { { product_id: product.id, quantity: 1 } }
        run_test!
      end
    end
  end

  path "/cart/items/{id}" do
    parameter name: :id, in: :path, type: :integer

    let(:item) do
      user.create_cart!.cart_items.create!(product: product, quantity: 1, unit_price: product.price)
    end
    let(:id) { item.id }

    patch("aggiorna la quantità") do
      tags "Cart"
      security [{ bearerAuth: [] }]
      consumes "application/json"
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: { quantity: { type: :integer } },
        required: %w[quantity]
      }

      response(200, "quantità aggiornata") do
        let(:body) { { quantity: 3 } }
        run_test!
      end

      response(422, "quantità non valida") do
        let(:body) { { quantity: 0 } }
        run_test!
      end

      response(404, "riga non trovata") do
        let(:id) { 0 }
        let(:body) { { quantity: 3 } }
        run_test!
      end
    end

    delete("rimuove la riga dal carrello") do
      tags "Cart"
      security [{ bearerAuth: [] }]
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string

      response(200, "riga rimossa, restituisce il carrello") { run_test! }
    end
  end
end
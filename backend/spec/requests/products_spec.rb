require "swagger_helper"

RSpec.describe "products", type: :request do
  let(:admin)    { User.create!(name: "Admin", email: "admin@example.com", password: "password123", role: :admin) }
  let(:customer) { User.create!(name: "Cliente", email: "cliente@example.com", password: "password123") }
  let(:product)  { Product.create!(title: "Cuffie", price: 49.90, tags: ["audio"]) }
  let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: admin.id)}" }

  path "/products" do
    get("elenco prodotti") do
      tags "Products"
      produces "application/json"
      parameter name: :tag, in: :query, type: :string, required: false
      parameter name: :q, in: :query, type: :string, required: false

      response(200, "successful") do
        before { product }
        run_test!
      end
    end

    post("crea un prodotto (admin)") do
      tags "Products"
      security [{ bearerAuth: [] }]
      consumes "application/json"
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          title: { type: :string },
          description: { type: :string },
          price: { type: :number },
          tags: { type: :array, items: { type: :string } }
        },
        required: %w[title price]
      }

      response(201, "prodotto creato") do
        let(:body) { { title: "Cuffie", price: 49.9, tags: ["audio"] } }
        run_test!
      end

      response(422, "dati non validi") do
        let(:body) { { title: "", price: -1 } }
        run_test!
      end

      response(403, "utente non admin") do
        let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: customer.id)}" }
        let(:body) { { title: "Cuffie", price: 49.9 } }
        run_test!
      end
    end
  end

  path "/products/{id}" do
    parameter name: :id, in: :path, type: :integer
    let(:id) { product.id }

    get("dettaglio prodotto") do
      tags "Products"
      produces "application/json"

      response(200, "prodotto trovato") { run_test! }

      response(404, "prodotto non trovato") do
        let(:id) { 0 }
        run_test!
      end
    end

    patch("aggiorna un prodotto (admin)") do
      tags "Products"
      security [{ bearerAuth: [] }]
      consumes "application/json"
      produces "application/json"
      parameter name: :Authorization, in: :header, type: :string
      parameter name: :body, in: :body, schema: {
        type: :object,
        properties: {
          title: { type: :string },
          description: { type: :string },
          price: { type: :number },
          tags: { type: :array, items: { type: :string } }
        }
      }

      response(200, "prodotto aggiornato") do
        let(:body) { { title: "Cuffie Pro", price: 59.9 } }
        run_test!
      end

      response(404, "prodotto non trovato") do
        let(:id) { 0 }
        let(:body) { { title: "Cuffie Pro" } }
        run_test!
      end
    end

    delete("elimina un prodotto (admin)") do
      tags "Products"
      security [{ bearerAuth: [] }]
      parameter name: :Authorization, in: :header, type: :string

      response(204, "prodotto eliminato") { run_test! }

      response(403, "utente non admin") do
        let(:Authorization) { "Bearer #{JsonWebToken.encode(user_id: customer.id)}" }
        run_test!
      end
    end
  end
end
require 'rails_helper'

RSpec.describe Product, type: :model do
  
  it "prodotto con tutti i campi richiesti funziona correttamente" do
    product = Product.new(title: "Test Product", description: "Test Description", price: 10.0)
    expect(product).to be_valid
  end

  it "prodotto senza titolo non è valido" do
    product = Product.new(description: "Test Description", price: 10.0)
    expect(product).not_to be_valid
    expect(product.errors[:title]).to be_present
  end

  it "prodotto con prezzo negativo non è valido" do
    product = Product.new(title: "Test Product", description: "Test Description", price: -10.0)
    expect(product).not_to be_valid
    expect(product.errors[:price]).to be_present
  end

  it "prodotto con prezzo zero non è valido" do
    product = Product.new(title: "Test Product", description: "Test Description", price: 0.0)
    expect(product).not_to be_valid
    expect(product.errors[:price]).to be_present
  end

  it "prodotto senza prezzo non è valido" do
    product = Product.new(title: "Test Product", description: "Test Description")
    expect(product).not_to be_valid
    expect(product.errors[:price]).to be_present
  end
  
end

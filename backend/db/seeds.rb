User.find_or_create_by!(email: "admin@shop.it") do |user|
    user.name = "Admin"
    user.password = "password123"
    user.role = :admin
end

User.find_or_create_by!(email: "client@shop.it") do |user|
    user.name = "John"
    user.password = "password123"
end

Product.find_or_create_by!(name: "Product 1") do |product|
    product.description = "Test product 1"
    product.price = 10.0
User.find_or_create_by!(email: "admin@shop.it") do |user|
    user.name = "Admin"
    user.password = "password123"
    user.role = :admin
end

User.find_or_create_by!(email: "client@shop.it") do |user|
    user.name = "John"
    user.password = "password123"
end

Product.find_or_create_by!(title: "Product 1") do |product|
    product.title = "Taglia erba 1"
    product.description = "Taglia erba elettrico con batteria al litio, ideale per giardini di piccole dimensioni."
    product.price = 39.00
    product.tags = ["Casa", "Giardino"]
end

Product.find_or_create_by!(title: "Product 2") do |product|
    product.title = "Scarpa da trekking"
    product.description = "Scarpa da trekking per il terreno difficile, con suola antiscivolo e cintura regolabile."
    product.price = 89.00
    product.tags = ["Abbigliamento", "Sport"]
end
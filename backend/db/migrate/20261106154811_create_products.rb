class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :title, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :tags, array: true, default: []

      t.timestamps
    end
  end
end

export interface Product {
  id: number;
  nome: string;
  descrizione: string | null;
  prezzo: number;
  giacenza: number;
  valutazione_media: number | null;
}

export interface ProductCreate {
  nome: string;
  descrizione: string | null;
  prezzo: number;
  giacenza: number;
}
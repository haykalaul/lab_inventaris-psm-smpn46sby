-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['Fisika'::text, 'Kimia'::text, 'Biologi'::text])),
  good_condition integer DEFAULT 0 CHECK (good_condition >= 0),
  fair_condition integer DEFAULT 0 CHECK (fair_condition >= 0),
  damaged integer DEFAULT 0 CHECK (damaged >= 0),
  lost integer DEFAULT 0 CHECK (lost >= 0),
  location text DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.journal_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  CONSTRAINT journal_items_pkey PRIMARY KEY (id),
  CONSTRAINT journal_items_journal_id_fkey FOREIGN KEY (journal_id) REFERENCES public.journals(id),
  CONSTRAINT journal_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.journals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time without time zone NOT NULL,
  teacher_name text NOT NULL,
  class text NOT NULL,
  topic text NOT NULL,
  result text DEFAULT ''::text,
  notes text DEFAULT ''::text,
  return_date date,
  signature text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  sign_method character varying DEFAULT 'qr'::character varying,
  signature_url text,
  signature_data text,
  CONSTRAINT journals_pkey PRIMARY KEY (id),
  CONSTRAINT journals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.lkm_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_level text NOT NULL CHECK (class_level = ANY (ARRAY['7'::text, '8'::text, '9'::text])),
  file_url text NOT NULL,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lkm_documents_pkey PRIMARY KEY (id),
  CONSTRAINT lkm_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transaction_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  borrow_condition text DEFAULT 'Baik'::text CHECK (borrow_condition = ANY (ARRAY['Baik'::text, 'Kurang Baik'::text])),
  return_condition text CHECK (return_condition = ANY (ARRAY['Baik'::text, 'Kurang Baik'::text, 'Rusak'::text, 'Hilang'::text])),
  CONSTRAINT transaction_items_pkey PRIMARY KEY (id),
  CONSTRAINT transaction_items_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT transaction_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  borrower_name text NOT NULL,
  class text DEFAULT ''::text,
  activity text DEFAULT ''::text,
  borrow_date date NOT NULL,
  borrow_time time without time zone NOT NULL,
  return_date date,
  return_time time without time zone,
  status text DEFAULT 'Dipinjam'::text CHECK (status = ANY (ARRAY['Dipinjam'::text, 'Dikembalikan'::text])),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
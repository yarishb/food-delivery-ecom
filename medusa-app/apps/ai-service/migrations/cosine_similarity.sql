-- Перестворюємо таблицю під 768 вимірів
drop table if exists document_sections cascade;

create table document_sections (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    metadata jsonb,
    embedding vector(768) -- Змінено з 384 на 768!
);

-- Оновлюємо також функцію пошуку (теж міняємо аргумент на vector(768))
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_sections.id,
    document_sections.content,
    document_sections.metadata,
    1 - (document_sections.embedding <=> query_embedding) as similarity
  from document_sections
  where 1 - (document_sections.embedding <=> query_embedding) > match_threshold
  order by document_sections.embedding <=> query_embedding asc
  limit match_count;
$$;
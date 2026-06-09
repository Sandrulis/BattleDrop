-- BattleDrop: public storage bucket for blog article images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "blog_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-images');

create policy "blog_images_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "blog_images_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  )
  with check (
    bucket_id = 'blog-images'
    and coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

create policy "blog_images_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and coalesce(
      (select is_admin from public.users where id = auth.uid()),
      false
    )
  );

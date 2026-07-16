/* ==========================================================================
   GETVIA — Supabase connection config

   1. Go to your Supabase project → Settings (gear icon) → API
   2. Copy "Project URL" and paste it below as SUPABASE_URL
   3. Copy the "anon public" key and paste it below as SUPABASE_ANON_KEY
      (this key is SAFE to expose in client-side code — it's designed for
      that, and your database is protected separately by the Row Level
      Security policies in sql/schema.sql)
   4. Save this file and redeploy

   Until you fill these in, the site automatically falls back to the
   built-in demo data so it still looks complete.
   ========================================================================== */

const SUPABASE_URL = "https://ulcqvsirbzlwzaalheua.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qvgg1nIMMgLScVsYRu3nnQ_mJXVdZog";


import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://uzrsvbyoscfgxycaalus.supabase.co/rest/v1/";
const SUPABASE_KEY = "sb_publishable_RuVxmo_nptfuXnBvJBOlDw_TL9_MYd3";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
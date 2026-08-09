-- ==============================================================================
-- OSPREY IT HELPDESK - DATABASE MIGRATION: HITL LEDGER & IMMUTABLE AUDIT
-- Migration Identifier: 20260805120000_init_hitl
-- ==============================================================================

-- 1. Create HITL Transactions Queue Table
create table if
  not exists public.hitl_transactions (
    id uuid primary key default gen_random_uuid (),
    session_id text not null,
    tool_name text not null,
    payload jsonb not null,
    status text not null default 'PENDING' check (
      status in ('PENDING', 'APPROVED', 'MODIFIED', 'REJECTED')
    ),
    risk_reason text not null,
    user_id text not null,
    user_email text not null,
    admin_notes text,
    created_at timestamptz not null default now (),
    updated_at timestamptz not null default now ()
  );

-- Create index on transaction queues for fast status sorting and session filtering
create index if not exists idx_hitl_transactions_status on public.hitl_transactions (status);

create index if not exists idx_hitl_transactions_session on public.hitl_transactions (session_id);

-- 2. Create Immutable Audit Logs Table
create table if
  not exists public.audit_logs (
    id uuid primary key default gen_random_uuid (),
    transaction_id uuid references public.hitl_transactions (id) on delete set null,
    actor text not null, -- 'OSPREY_AI' or 'ADMIN:[clerk_user_id]'
    action text not null, -- 'SUSPENDED', 'APPROVED', 'MODIFIED', 'REJECTED', 'RESUMED'
    payload_snapshot jsonb not null,
    created_at timestamptz not null default now ()
  );

-- Create index on audit logs for timeline queries
create index if not exists idx_audit_logs_timeline on public.audit_logs (created_at desc);

-- 3. Trigger Function: Update transaction updated_at timestamp
create or replace function public.update_updated_at_column () returns trigger as $$
begin
    NEW.updated_at = now();
    RETURN NEW;
end;
$$ language plpgsql;

create trigger trigger_update_hitl_transactions_timestamp before update on public.hitl_transactions for each row execute function public.update_updated_at_column ();

-- 4. Trigger Function: BLOCK all updates and deletes on public.audit_logs
create or replace function public.block_immutable_audit_logs () returns trigger as $$
begin
    RAISE EXCEPTION '❌ SECURITY VIOLATION: The audit_logs table is immutable. UPDATE and DELETE actions are strictly prohibited.';
    RETURN NULL;
end;
$$ language plpgsql;

create trigger trigger_block_audit_log_mutations before update
or delete on public.audit_logs for each row execute function public.block_immutable_audit_logs ();

-- 5. Enable Real-Time Replication for Transaction Queue Status Syncing
-- This allows @tanstack/react-table dashboard instances to receive row appends/updates instantly without polling
begin;

-- Create publication if not exists or ignore
alter publication supabase_realtime add table public.hitl_transactions;

commit;

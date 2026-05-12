import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableCell,
} from "../components/ui/DataTable";
import { listPersons } from "../services/personService";
import { createTransaction, listTransactions } from "../services/transactionService";
import { getErrorMessage } from "../lib/http";

const emptyForm = {
  personId: "",
  amount: "",
  type: "DEPOSIT",
  description: "",
};

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persons, setPersons] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [people, txs] = await Promise.all([listPersons(), listTransactions()]);
      setPersons(people);
      setTransactions(txs);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load transactions."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await createTransaction({
        personId: Number(form.personId),
        amount: form.amount,
        type: form.type,
        description: form.description || null,
      });
      setSuccess("Transaction saved successfully.");
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create transaction."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mt-2 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Create transaction" className="xl:col-span-1">
          <form className="mt-2 space-y-4" onSubmit={onSubmit}>
            <FormField label="Person" htmlFor="tx-personId">
              <Select id="tx-personId" name="personId" value={form.personId} onChange={onChange} required>
                <option value="">Select person</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.nameEn} ({person.id})
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Amount" htmlFor="tx-amount">
              <Input
                id="tx-amount"
                name="amount"
                value={form.amount}
                onChange={onChange}
                placeholder="Amount"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </FormField>
            <FormField label="Type" htmlFor="tx-type">
              <Select id="tx-type" name="type" value={form.type} onChange={onChange}>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAW">Withdraw</option>
              </Select>
            </FormField>
            <FormField label="Description" htmlFor="tx-description">
              <Input
                id="tx-description"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Optional note"
              />
            </FormField>
            <Button type="submit" variant="primary" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Create transaction"}
            </Button>
          </form>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}
        </Card>

        <Card
          title="Transaction list"
          className="xl:col-span-2"
          headerRight={
            <Button type="button" variant="secondary" size="sm" onClick={loadData}>
              Refresh
            </Button>
          }
        >
          {!loading && transactions.length === 0 ? (
            <p className="text-sm text-[#64748B]">No transactions recorded yet.</p>
          ) : null}
          {!loading && transactions.length > 0 ? (
            <DataTable flush className="mt-2">
              <DataTableHead>
                <DataTableHeaderCell>ID</DataTableHeaderCell>
                <DataTableHeaderCell>Person</DataTableHeaderCell>
                <DataTableHeaderCell>Type</DataTableHeaderCell>
                <DataTableHeaderCell>Amount</DataTableHeaderCell>
                <DataTableHeaderCell>Approved by</DataTableHeaderCell>
                <DataTableHeaderCell>Occurred at</DataTableHeaderCell>
              </DataTableHead>
              <tbody>
                {transactions.map((tx) => (
                  <DataTableRow key={tx.id}>
                    <DataTableCell className="font-mono text-sm">{tx.id}</DataTableCell>
                    <DataTableCell>{tx.person?.nameEn || "—"}</DataTableCell>
                    <DataTableCell>
                      {tx.type === "WITHDRAW" ? (
                        <Badge variant="danger" className="normal-case">
                          {tx.type}
                        </Badge>
                      ) : (
                        <Badge variant="success" className="normal-case">
                          {tx.type}
                        </Badge>
                      )}
                    </DataTableCell>
                    <DataTableCell className="font-medium">{tx.amount}</DataTableCell>
                    <DataTableCell className="text-[#64748B]">{tx.approvedBy || "—"}</DataTableCell>
                    <DataTableCell className="whitespace-nowrap text-[#64748B]">
                      {tx.occurredAt ? new Date(tx.occurredAt).toLocaleString() : "—"}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </tbody>
            </DataTable>
          ) : null}
        </Card>
      </div>
    </AppLayout>
  );
}

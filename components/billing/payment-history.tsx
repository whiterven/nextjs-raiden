'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PaymentHistory() {
  // This would come from your database
  const payments = [
    {
      id: '1',
      date: '2024-04-01',
      amount: '$19.00',
      status: 'succeeded',
      paymentMethod: 'Visa ending in 4242',
    },
    {
      id: '2',
      date: '2024-03-01',
      amount: '$19.00',
      status: 'succeeded',
      paymentMethod: 'Visa ending in 4242',
    },
    {
      id: '3',
      date: '2024-02-01',
      amount: '$19.00',
      status: 'succeeded',
      paymentMethod: 'Visa ending in 4242',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your past payments and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === 'succeeded'
                        ? 'default'
                        : payment.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.paymentMethod}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 
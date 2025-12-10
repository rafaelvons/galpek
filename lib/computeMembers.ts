export function computeMembersStats(transactions: any[], members: any[]) {
  return members.map((member) => {
    const relatedTransactions = transactions.filter((t) =>
      t.members.includes(member.id)
    );

    const totalEarned = relatedTransactions.reduce(
      (sum, t) => sum + t.per_person,
      0
    );

    return {
      ...member,
      total_earned: totalEarned,
      total_transactions: relatedTransactions.length,
    };
  });
}

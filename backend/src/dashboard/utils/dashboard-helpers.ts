export const getTimeRangeDays = (timeRange: string): number => {
  switch (timeRange) {
    case "30days":
      return 30;
    case "90days":
      return 90;
    case "365days":
      return 365;
    default:
      return 7;
  }
};

export const getDefaultMessagesData = (timeRange: string) => {
  const days = getTimeRangeDays(timeRange);
  const messagesPerDay: Array<{ date: string; messages: number }> = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    messagesPerDay.push({
      date: date.toISOString().split("T")[0],
      messages: 0,
    });
  }

  return messagesPerDay;
};

export const getDefaultPerformanceData = () => {
  return {
    byMessages: [],
    byConversations: [],
  };
};

class LotteryNumber {
    private int value;

    public LotteryNumber() {
        value = (int) (Math.random() * 49 + 1);
    }

    public int getValue() {
        return value;
    }
}

//#START STATIC
public class Lottery {
    public static void main(String[] args) {
//#START STUDENT
        final int count = 6;

//#START SOLUTION
        final int count = 6;
        LotteryNumber[] numbers = new LotteryNumber[count];

        for (int i = 0; i < count; i++) {
            numbers[i] = new LotteryNumber();
        }

        for (int i = 0; i < count; i++) {
            System.out.print(numbers[i].getValue() + " ");
        }
//#START STATIC
    }
}

//#START STATIC
public class Gregorian {
//#START STUDENT
    
//#START SOLUTION
    public static boolean isLeapYear(int year)
//#START STATIC
    {
        if (year % 4 == 0) {
            if (year % 100 == 0) {
                if (year % 400 == 0) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isLeapYear(2018));
        System.out.println(isLeapYear(2004));
        System.out.println(isLeapYear(2000));
        System.out.println(isLeapYear(1900));
    }
}

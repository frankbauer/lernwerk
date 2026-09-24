//#START STATIC
public class Calculator {
    public static void main(String[] args) {
        final int hoursPerECTS = 30;
        int weeks = 13;
        float ECTS;
//#START STUDENT

//#START SOLUTION
        ECTS = 7.5f;
        float load = ECTS * hoursPerECTS / weeks;
//#START STATIC
        System.out.println("Bei " + ECTS + " ECTS fallen " + load + " Stunden pro Woche an.");
    }
}

//#START STATIC
public class RiceGrains {
    public static void main(String[] args) {
        final int fields = Input.getFields(args);
//#START STUDENT

//#START SOLUTION
        // Akkumulator für die Gesamtzahl der Körner
        long total = 0;
        // Körner auf dem aktuellen Feld
        long grains = 1;
        for (int i = 1; i <= fields; i++) {
            total += grains;
            grains *= 2;
        }
//#START STATIC
        System.out.println("Auf " + fields + " Feldern liegen " + total + " Reiskörner.");
    }
}
//#START API
class Input {
    protected static int getFields(String[] args) {
        try {
            return Integer.parseInt(args[0].trim());
        } catch (Exception e) {
            return 32;
        }
    }
}

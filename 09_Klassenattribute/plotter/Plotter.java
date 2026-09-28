//#START STATIC
public class Plotter {
    static final double A = 100;
    static final double B = 10;
    static int callCount = 0;

//#START STUDENT

//#START SOLUTION
    private static double f(double x, double k, double t) {
        Plotter.callCount++;
        return Plotter.A * Math.sqrt(Math.abs(x - t * k * k)) + t * Math.abs(k + Plotter.B);
    }
//#START STATIC

    public static void main(String[] args) {
        for (double x = -1; x < 2; x += 0.25) {
            Plotter.zeichne(x, f(x, -12, 0.01));
        }
        System.out.println("Call Counter: " + Plotter.callCount);
        Plotter.sendeErgebnis();
    }

    private static void zeichne(double x, double y) {
        /* ... */
//#START API
        points += (points.isEmpty() ? "" : ",") + "[" + toJson(x) + "," + toJson(y) + "]";
    }

    private static String points = "";

    private static String toJson(double d) {
        return Double.isFinite(d) ? Double.toString(d) : "null";
    }

    private static void sendeErgebnis() {
        de.fau.tf.lgdv.CodeBlocks.postResult("{\"points\":[" + points + "],\"callCount\":" + callCount + "}");
//#START STATIC
    }
}

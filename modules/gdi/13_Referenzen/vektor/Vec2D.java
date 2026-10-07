//#START STATIC
public class Vec2D {
    private double x;
    private double y;

    public Vec2D(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public Vec2D() {
        this(0, 0);
    }

    public double getX() {
        return this.x;
    }

    public double getY() {
        return this.y;
    }

    public void setX(double x) {
        this.x = x;
    }

    public void setY(double y) {
        this.y = y;
    }

//#START STUDENT

//#START SOLUTION
    public double length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public void add(Vec2D other) {
        this.x += other.x;
        this.y += other.y;
    }

    private static void normalizeAll(Vec2D[] vectors) {
        for (int i = 0; i < vectors.length; i++) {
            // vec verweist auf dasselbe Objekt wie vectors[i], die Änderung wirkt also auf das Original
            Vec2D vec = vectors[i];
            double len = vec.length();
            vec.x = vec.x / len;
            vec.y = vec.y / len;
        }
    }

    public static void main(String[] args) {
        Vec2D v1 = new Vec2D(1, 2);
        Vec2D v2 = new Vec2D(2, 3);
        System.out.println(v1.length());

        v1.add(v2);
        System.out.println("v1 = (" + v1.x + ", " + v1.y + ")");

        Vec2D[] vecs = {v1, v2};
        normalizeAll(vecs);
        System.out.println("v1 = (" + v1.x + ", " + v1.y + "), v2 = (" + v2.x + ", " + v2.y + ")");
    }
//#START STATIC
}

 class Sphere extends Geometry {
    /**
     * The Radius of the Sphere
     */
    public final double radius;

    /**
     * Creates a new Sphere from a Point and Radius
     * 
     * @param p The center of the Sphere
     * @param r The spheres Radius
     */
    public Sphere(Vec3D p, double r) {
        super(p);
        this.radius = r;
    }

    @Override
    public String toString() {
        return super.toString() + " | " + radius;
    }

    /**
     * Returns the radius of the Sphere
     * 
     * @return The spheres radius
     */
    public double getRadius() {
        return radius;
    }
}

public class Line {
    public final Vec2D start;
    public final Vec2D dir;

    public Line(Vec2D start, Vec2D dir) {
        this.start = start;
        this.dir = dir;
    }

    public static Line fromPoints(Vec2D start, Vec2D end) {
        return new Line(start, end.sub(start));
    }

    public Vec2D getStart() {
        return start;
    }

    public Vec2D getDirection() {
        return dir;
    }

    public Line lineWithUnitDirection() {
        return new Line(start, dir.toUnitLength());
    }

    public Vec2D poinAt(double t) {
        return start.add(dir.mul(t));
    }

    @Override
    public String toString() {
        return "[line:" + start + "/" + dir + "]";
    }

    public Line rotateAroundStart(double angle) {
        Vec2D end = dir.rotateAround(Vec2D.Zero, angle);
        return new Line(start, end);
    }

    public Line rotateAroundEnd(double angle) {
        Vec2D end = dir.mul(-1).rotateAround(Vec2D.Zero, angle);
        return new Line(poinAt(1), end);
    }

    public double length() {
        return dir.length();
    }

    public Line invertDirection() {
        return new Line(poinAt(1), dir.mul(-1));
    }

    public Line lineWithNewLength(double len) {
        return new Line(start, dir.toUnitLength().mul(len));
    }
}

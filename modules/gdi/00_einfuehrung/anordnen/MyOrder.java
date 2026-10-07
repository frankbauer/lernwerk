public class MyOrder {
    public static void main(String[] args) {
        final int FIRST_FLOOR;
        FIRST_FLOOR = 0;
        House h = new House();
        h.setTown("Erlangen");
        Floor floor = new Floor(FIRST_FLOOR);
        h.addFloor(floor);
        floor = new Floor(FIRST_FLOOR+1);
        h.addFloor(floor);
    }
}

public class FinalRef {
    public static void main(String[] args) {
        final Baum b = new Baum("herbst");

        System.out.println(b.isWinter());
        b.setWinter();
        System.out.println(b.isWinter());
    }
}
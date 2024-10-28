//#START STATIC
public class MeineReferenzen {
    private int x;
    public MeineReferenzen(int val) {
        this.x = val;
    }

    public void foo(int x, MeineReferenzen ref) {
        ref = new MeineReferenzen(100);        
        x += 200;
        this.x += ref.x;
    }

    public static void main(String[] args) {
        MeineReferenzen a = new MeineReferenzen(10);
        MeineReferenzen b = new MeineReferenzen(20);
        int c = 30;

        a.foo(c, b);
        System.out.println(a.x + " " + b.x + " " + c);
    }
}
//#START STATIC
public class MeinePlaneten {
    public static void main(String[] args) {
        Universum u = new Universum();
//#START STUDENT        
        Sonne s = new Sonne(u);
        
//#START STATIC
        u.print();
    }
}
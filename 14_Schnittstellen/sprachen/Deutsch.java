//#START STATIC
interface Greeting {
    public void greet();
}

//#START STUDENT

//#START SOLUTION
class Deutsch implements Greeting {
    public void greet() {
        System.out.println("Guten Tag");
    }
}

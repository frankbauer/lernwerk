public class SimpleGraph {
    public static void main(String[] args){
        Graph<String> g = new Graph<>();

        g.add("A", "B", "C", "D", "E");
        
        g.addEdge("D", "B");
        g.addEdge("C", "B");
        g.addEdge("B", "A");

        //Die ForEach-Schleife iteriert über als Node-Instanzen (Knoten) des Graphen g.
        //Die Laufvariable n, entspricht für jedem Durchlauf dem aktuellen Knoten und wird ausgegeben.  
        for (Node<String> n : g) {
            System.out.println(n);
        }
             
        g.visualize();
    }
}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <netdb.h>
#include <arpa/inet.h>


int main(int argv, char * argc [])
{
    /*
        1. getaddrinfo
        2. create a new socket
        3. connect to the socket
        4. send data
    */    
    
    //Variables Declaration
    struct addrinfo hints, * res;
    int status;
    int socket_id;
    
    //clear hints
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_flags = AI_PASSIVE;

    status = getaddrinfo("127.0.0.1","5000", &hints, &res);
    if(status != 0)
    {
        fprintf(stderr, "Error getaddrinfo\n");
        exit(1);
    }         
    
    socket_id = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    if(socket_id < 0)
    {
        fprintf(stderr, "Error socket \n");
        exit(2);
    }
    
    status = connect(socket_id, res->ai_addr, res->ai_addrlen);
    if(status < 0)
    {
        fprintf(stderr, "Error connect \n");
        exit(3);
    }
    
    int numbytes = 0;
    float buf = 1.0;
    for ( int i=0;i<10;++i )
    {
        numbytes = send(socket_id,&buf,sizeof(float),0);
        if(numbytes == -1)
        {
            fprintf(stderr, "Error receive \n");
            exit(4);
        }
        printf ( "%f sent\n", buf );
        buf += 1.383;
        sleep(1);
    }
    freeaddrinfo(res);
    close(socket_id);
    return 0;
}

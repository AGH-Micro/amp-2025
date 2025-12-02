
function [I, Q] = generator(t)
    
    A=8*(1+rand(1)/10); %
    B=10*(1+rand(1)/10); %6
    b=(3+rand(1)/100);
    a=(4+rand(1)/100);
    phi=(pi/6+rand(1)/1000);
    
    I=a+A*cos(t);
    Q=b+B*sin(t+phi);
end




    